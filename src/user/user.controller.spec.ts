import { find } from 'rxjs';
import { UserController } from './user.controller';

describe('User Controller', () => {
  let controller: UserController;

  const userServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadPicture: jest.fn(),
  };

  beforeEach(() => {
    controller = new UserController(userServiceMock as any);
  });

  it('create - should use UserService with correct argument', async () => {
    const argument = { key: 'value' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(userServiceMock, 'create').mockResolvedValue(expected);

    const result = await controller.create(argument as any);

    expect(userServiceMock.create).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expected);
  });

  it('findAll - should use UserService', async () => {
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(userServiceMock, 'findAll').mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(userServiceMock.findAll).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
  it('findOne - should use UserService with correct argument', async () => {
    const argument = 1;
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(expected);

    const result = await controller.findOne(argument as any);

    expect(userServiceMock.findOne).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expected);
  });
  it('update - should use UserService with correct argument', async () => {
    const argument1 = 1;
    const argument2 = { keyValue: 'value' };
    const argument3 = { keyValue: 'value' };
    const expected = { keyValue: 'anyValue' };

    jest.spyOn(userServiceMock, 'update').mockResolvedValue(expected);

    const result = await controller.update(
      argument1 as any,
      argument2 as any,
      argument3 as any,
    );

    expect(userServiceMock.update).toHaveBeenCalledWith(
      argument1,
      argument2,
      argument3,
    );
    expect(result).toEqual(expected);
  });
  it('remove - should use UserService with correct argument', async () => {
    const argument1 = 1;
    const argument2 = { keyValue: 'value' };
    const expected = { keyValue: 'anyValue' };

    jest.spyOn(userServiceMock, 'remove').mockResolvedValue(expected);

    const result = await controller.remove(argument1 as any, argument2 as any);

    expect(userServiceMock.remove).toHaveBeenCalledWith(+argument1, argument2);
    expect(result).toEqual(expected);
  });
  it('uploadPicture - should use UserService with correct argument', async () => {
    const argument1 = { aKey: 'aValue' };
    const argument2 = { bKey: 'bValue' };
    const expected = { anyKey: 'anyValue' };

    jest.spyOn(userServiceMock, 'uploadPicture').mockResolvedValue(expected);

    const result = await controller.uploadPicture(
      argument1 as any,
      argument2 as any,
    );

    expect(userServiceMock.uploadPicture).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });
});
