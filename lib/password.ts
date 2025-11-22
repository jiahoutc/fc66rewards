import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
    // return Promise.resolve(password + '_hashed')
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
    // return Promise.resolve(hash === password + '_hashed')
}
