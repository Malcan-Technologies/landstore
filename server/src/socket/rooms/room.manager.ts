import type { AppSocket } from "../types/socket.types.js";
import { ROOM_PREFIX } from "../constants/events.js";

export const getUserRoomName = (userId: string): string => {
	return `${ROOM_PREFIX.USER}:${userId}`;
};

export const getEnquiryRoomName = (enquiryId: string): string => {
	return `${ROOM_PREFIX.ENQUIRY}:${enquiryId}`;
};

export const joinUserRoom = async (socket: AppSocket, userId: string): Promise<void> => {
	await socket.join(getUserRoomName(userId));
};

export const joinEnquiryRoom = async (
	socket: AppSocket,
	enquiryId: string
): Promise<void> => {
	await socket.join(getEnquiryRoomName(enquiryId));
};

export const leaveEnquiryRoom = async (
	socket: AppSocket,
	enquiryId: string
): Promise<void> => {
	await socket.leave(getEnquiryRoomName(enquiryId));
};
