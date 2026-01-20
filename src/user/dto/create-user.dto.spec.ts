import { CreateUserDto } from './create-user.dto';
import { validate } from 'class-validator';

describe('CreateUserDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateUserDto();
    dto.email = 'teste@example.com';
    dto.password = '123456789';
    dto.name = 'Lucas Castro';

    const errors = await validate(dto);
    expect(errors.length).toBe(0); // Nenhum erro significa que o DTO é válido
  });

  it('should fail if email not is valid', async () => {
    const dto = new CreateUserDto();
    dto.email = 'email-invalid';
    dto.password = '123456789';
    dto.name = 'Lucas Castro';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if password is to small', async () => {
    const dto = new CreateUserDto();
    dto.email = 'teste@example.com';
    dto.password = '123';
    dto.name = 'Lucas Castro';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if name is empty', async () => {
    const dto = new CreateUserDto();
    dto.email = 'teste@example.com';
    dto.password = '123456789';
    dto.name = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail if name is to long', async () => {
    const dto = new CreateUserDto();
    dto.email = 'teste@example.com';
    dto.password = '123456789';
    dto.name = 'a'.repeat(101);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
