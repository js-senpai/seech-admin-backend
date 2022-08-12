import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SelectedSaleTickets,
  SelectedSaleTicketsDocument,
} from '../../common/schemas/selectedSaleTickets.schema';
import {
  SelectedBuyTickets,
  SelectedBuyTicketsDocument,
} from '../../common/schemas/selectedBuyTickets.schema';
import { User, UserDocument } from '../../common/schemas/users.schema';
import { Ticket, TicketDocument } from '../../common/schemas/ticket.schema';
import SelectedTicketsDto from './selected-tickets.dto';

@Injectable()
export class SelectedTicketsService {
  private readonly logger = new Logger(SelectedTicketsService.name);

  constructor(
    @InjectModel(SelectedSaleTickets.name)
    private readonly selectedSaleTicketsModel: Model<SelectedSaleTicketsDocument>,
    @InjectModel(SelectedBuyTickets.name)
    private readonly selectedBuyTicketsModel: Model<SelectedBuyTicketsDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async update({
    tickets = [],
    isSale = false,
    user,
  }: SelectedTicketsDto & {
    user: User;
  }): Promise<{
    ok: string;
  }> {
    try {
      const getSelectedTickets = isSale
        ? await this.selectedSaleTicketsModel.findOne({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userId: user._id,
          })
        : await this.selectedBuyTicketsModel.findOne({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userId: user._id,
          });
      const activeTicketsIds = tickets
        .filter(({ checked }) => checked)
        .map(({ _id }) => _id);
      const notActiveTicketsIds = tickets
        .filter(({ checked }) => !checked)
        .map(({ _id }) => _id);
      const getTickets = await this.ticketModel.find({
        sale: isSale,
        _id: {
          $in: activeTicketsIds,
        },
      });
      if (!getSelectedTickets) {
        // Create data
        if (isSale) {
          await this.selectedSaleTicketsModel.create({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userId: user._id,
            tickets: getTickets.map(({ _id }) => _id),
          });
        } else {
          await this.selectedBuyTicketsModel.create({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            userId: user._id,
            tickets: getTickets.map(({ _id }) => _id),
          });
        }
      } else {
        const filteredNotActiveTickets = getSelectedTickets.tickets.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (_id) => notActiveTicketsIds.includes(_id.toString()),
        );
        const filteredActiveTickets = getSelectedTickets.tickets.filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (_id) => notActiveTicketsIds.includes(_id.toString()),
        );
        const getUniqueActiveTickets = getTickets.filter(({ _id }) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          filteredActiveTickets.findIndex((id) => id !== _id),
        );
        // Update data
        if (isSale) {
          if (filteredNotActiveTickets.length) {
            await this.selectedSaleTicketsModel.updateOne(
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userId: user._id,
              },
              {
                $pull: {
                  tickets: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    $in: filteredNotActiveTickets.map(({ _id }) => _id),
                  },
                },
              },
            );
          }
          if (getUniqueActiveTickets.length) {
            await this.selectedSaleTicketsModel.updateOne(
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userId: user._id,
              },
              {
                $push: {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  tickets: getUniqueActiveTickets.map(({ _id }) => _id),
                },
              },
            );
          }
        } else {
          if (filteredNotActiveTickets.length) {
            await this.selectedBuyTicketsModel.updateOne(
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userId: user._id,
              },
              {
                $pull: {
                  tickets: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    $in: filteredNotActiveTickets.map(({ _id }) => _id),
                  },
                },
              },
            );
          }
          if (getUniqueActiveTickets.length) {
            await this.selectedBuyTicketsModel.updateOne(
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userId: user._id,
              },
              {
                $push: {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  tickets: getUniqueActiveTickets.map(({ _id }) => _id),
                },
              },
            );
          }
        }
      }
      return {
        ok: 'Data has been successfully updated',
      };
    } catch (e) {
      this.logger.error(`Error in update selected tickets method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in update selected tickets method.  ${e}`,
      );
    }
  }
}
