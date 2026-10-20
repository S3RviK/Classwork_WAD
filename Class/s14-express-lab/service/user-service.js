import { User } from "../models/User";

const createUser = async ({username, name, email, password }) => {
    const user = await User.create({
        username,
        name,
        email,
        password
    }).catch((debError) => console.error(dbError.message));
    return user;
};

const findUser = async (queryname) => {
    const userFound = await User.find({ username: queryname }).catch((dbError) => console.error(dbError.message));
    return userFound[0];
};

export const findUsers = async (name) => {
    return await User.find({ name }).sort({ name: 1 }).catch((dbError) => console.error(dbError.message));
}