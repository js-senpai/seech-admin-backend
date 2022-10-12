import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../../../common/schemas/ticket.schema';
import { I18nService } from 'nestjs-i18n';
import { RoleDecorator } from '../../../common/decorators/role.decorator';
import { GetProductsInterface } from '../../../common/interfaces/products.interfaces';
import * as moment from 'moment/moment';
import BuyProductsDto, { CreateBuyProductsDto } from './buy-products.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ICreateBuyProducts } from './buy-products.interface';

@Injectable()
export class BuyProductsService {
  private readonly logger = new Logger(BuyProductsService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @RoleDecorator(['user'])
  async get({
    startDate = '',
    endDate = '',
    regions = '',
    states = '',
    otg = '',
    types = '',
    subtypes = '',
    user,
  }: BuyProductsDto & {
    user: User;
  }): Promise<GetProductsInterface> {
    try {
      const getUsers = await this.userModel.find({
        ...(regions && {
          region: {
            $in: regions.split(','),
          },
        }),
        ...(states && {
          countryState: {
            $in: states.split(','),
          },
        }),
        ...(otg && {
          countryOtg: {
            $in: otg.split(','),
          },
        }),
      });
      const typesList = types.split(',').flatMap((name) =>
        Object.values(
          this.i18n.translate(`index.productsList.${name}List`, {
            lang: 'ua',
          }),
        ),
      );
      const getTotalBuyTickets = await this.ticketModel.find(
        {
          sale: false,
          active: true,
          authorId: {
            $in: getUsers.map(({ userId }) => userId),
          },
          ...((types || subtypes) && {
            culture: {
              $in: [...typesList, ...subtypes.split(',')],
            },
          }),
        },
        null,
        {
          createdAt: -1,
        },
      );
      const filteredTotalBuyTickets = (
        startDate && endDate
          ? getTotalBuyTickets.filter(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ({ createdAt }) =>
                createdAt &&
                moment(createdAt).isBetween(
                  moment(startDate, 'DD-MM-YYYY'),
                  moment(endDate, 'DD-MM-YYYY'),
                  'day',
                  '[]',
                ),
            )
          : getTotalBuyTickets
      ).filter(
        ({ date }) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Date.now() - date <= 24 * 60 * 60 * 1000,
      );
      const response: GetProductsInterface = {
        items: [],
      };
      for (const {
        authorId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        createdAt,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updatedAt,
        culture,
        description = '',
        weight,
        _id,
        weightType = 'not set',
        price,
      } of filteredTotalBuyTickets) {
        if (createdAt) {
          const getUser = await this.userModel.findOne({
            userId: authorId,
          });
          if (getUser) {
            const { region, countryState, countryOtg, name, phone } = getUser;
            response.items.push({
              _id,
              updatedAt,
              title: culture,
              weight,
              weightType,
              region,
              state: countryState,
              otg: countryOtg,
              author: name,
              phone,
              description,
              price,
              ownTicket: authorId.toString() === user.userId.toString(),
              inBasket:
                user.basket.findIndex(
                  ({ id }) => id.toString() === _id.toString(),
                ) !== -1,
            });
          }
        }
      }
      return response;
    } catch (e) {
      this.logger.error(`Error in get buy products method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in get buy products method.  ${e}`,
      );
    }
  }

  @RoleDecorator(['user'])
  async create({
    typeCode,
    subtypeCode,
    subtype,
    weight,
    description,
    user,
  }: CreateBuyProductsDto & {
    user: User;
  }): Promise<ICreateBuyProducts> {
    try {
      let weightType = 'kilogram';
      const cultureWithLiters = ['honey', 'milk', 'sourCream'];
      const cultureWithTon = ['wheat', 'barley', 'corn', 'buckwheat', 'soy'];
      if (
        cultureWithLiters.includes(subtypeCode) ||
        cultureWithLiters.includes(typeCode)
      ) {
        weightType = 'liter';
      } else if (
        cultureWithTon.includes(subtypeCode) ||
        cultureWithTon.includes(typeCode)
      ) {
        weightType = 'weightTon';
      } else if (subtypeCode === 'egg') {
        weightType = 'amount';
      }
      // Create new ticket
      const newTicket = await this.ticketModel.create({
        sale: false,
        authorId: user.userId,
        weight,
        weightType,
        description,
        culture: subtype,
        active: true,
        date: new Date(),
      });
      await this.userModel.updateOne(
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: user._id,
        },
        {
          state: `createTicketFromApp_${newTicket._id}`,
        },
      );
      await axios.post(
        `https://api.telegram.org/bot${this.configService.get(
          'TELEGRAM_TOKEN',
        )}/sendMessage`,
        {
          chat_id: user.userId,
          text: this.i18n.translate(
            `index.telegram.bot.input.createTicketFromApp`,
            {
              lang: 'ua',
            },
          ),
          parse_mode: 'HTML',
        },
      );
      const callback = async () => {
        const { modifiedCount } = await newTicket.updateOne({
          active: false,
        });
        if (modifiedCount) {
          let weightValue;
          switch (newTicket.weightType) {
            case 'liter':
              weightValue = 'volumeValue';
              break;
            case 'weight':
              weightValue = 'weightValue';
              break;
            case 'weightTon':
              weightValue = 'weightTonValue';
              break;
            case 'amount':
              weightValue = 'amountValue';
              break;
            default:
              weightValue = 'weightValue';
          }
          let weightName;
          switch (newTicket.weightType) {
            case 'liter':
              weightName = 'volume';
              break;
            case 'weight':
            case 'weightTon':
              weightName = 'weight';
              break;
            case 'amount':
              weightName = 'amount';
              break;
            default:
              weightName = 'weight';
          }
          await axios.post(
            `https://api.telegram.org/bot${this.configService.get(
              'TELEGRAM_TOKEN',
            )}/sendMessage`,
            {
              chat_id: user.userId,
              text: this.i18n.translate(`index.telegram.schedule.extend`, {
                lang: 'ua',
              }),
              parse_mode: 'HTML',
            },
          );
          await axios.post(
            `https://api.telegram.org/bot${this.configService.get(
              'TELEGRAM_TOKEN',
            )}/sendMessage`,
            {
              chat_id: user.userId,
              text: this.i18n.translate(
                `index.telegram.schedule.buyingTicketOwn`,
                {
                  lang: 'ua',
                  args: {
                    culture: subtype,
                    active: newTicket.active,
                    price: newTicket.price,
                    weightValue: this.i18n.translate(
                      `index.types.${weightValue}`,
                      {
                        lang: 'ua',
                      },
                    ),
                    weightName: this.i18n.translate(
                      `index.types.${weightName}`,
                      {
                        lang: 'ua',
                      },
                    ),
                    weight: newTicket.weight,
                    date: newTicket.date,
                  },
                },
              ),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboards: [
                  [
                    {
                      text: this.i18n.translate(
                        `index.telegram.buttons.completed`,
                        {
                          lang: 'ua',
                        },
                      ),
                      callback_data: `completed_${newTicket._id}`,
                      hide: false,
                    },
                  ],
                  [
                    {
                      text: this.i18n.translate(
                        `index.telegram.buttons.remove`,
                        {
                          lang: 'ua',
                        },
                      ),
                      callback_data: `remove_${newTicket._id}`,
                      hide: false,
                    },
                  ],
                ],
              },
            },
          );
        }
      };
      const interval = setTimeout(callback, 24 * 60 * 60000);
      this.schedulerRegistry.addTimeout(
        `checkActiveBuyTicket_${newTicket._id}`,
        interval,
      );
      return {
        ok: 'New ticket has been created successfully',
      };
    } catch (e) {
      this.logger.error(`Error in create buy products method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in create buy products method.  ${e}`,
      );
    }
  }
}
