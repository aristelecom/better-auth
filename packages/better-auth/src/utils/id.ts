import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
export const generateId = (size?: number) => {
	return uuid();
};
