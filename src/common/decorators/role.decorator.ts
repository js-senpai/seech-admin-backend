import { ForbiddenException } from '@nestjs/common';

export const RoleDecorator = (roles = ['user']) => {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    // Get original method
    const originalMethod = descriptor.value;
    // Check auth in original method
    descriptor.value = async function (data) {
      const { user } = data;
      if (!roles.includes(user?.type)) {
        throw new ForbiddenException(
          `User with role ${user?.type} doesnt have access for this page`,
        );
      }
      return await originalMethod.call(this, data);
    };
    return descriptor;
  };
};
