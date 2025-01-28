import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import exp from 'constants';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed passoword', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);

    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('throws an error if signin is called with an unused email', async () => {
    try {
      await service.signin('asdfkl@asdfkl.com', 'asdf');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('throws if an invalid passowrd is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'asdf@asdf.com', password: '13234' } as User]);
    try {
      await service.signin('asdf@asdf.com', 'password');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
