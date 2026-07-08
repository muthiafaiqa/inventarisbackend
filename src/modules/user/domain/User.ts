export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public nama: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
