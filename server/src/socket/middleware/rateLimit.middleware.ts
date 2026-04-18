import type { AppSocket } from "../types/socket.types.js";

type Bucket = {
	count: number;
	windowStart: number;
};

const connectionBuckets = new Map<string, Bucket>();
const eventBuckets = new Map<string, Bucket>();

const now = () => Date.now();

const isAllowed = (
	store: Map<string, Bucket>,
	key: string,
	maxCount: number,
	windowMs: number
): boolean => {
	const currentTime = now();
	const existing = store.get(key);

	if (!existing) {
		store.set(key, { count: 1, windowStart: currentTime });
		return true;
	}

	if (currentTime - existing.windowStart > windowMs) {
		store.set(key, { count: 1, windowStart: currentTime });
		return true;
	}

	if (existing.count >= maxCount) {
		return false;
	}

	existing.count += 1;
	store.set(key, existing);
	return true;
};

export const socketRateLimitMiddleware = (
	socket: AppSocket,
	next: (err?: Error) => void
) => {
	const ip = socket.handshake.address || "unknown";
	const allowed = isAllowed(connectionBuckets, `connect:${ip}`, 30, 60_000);

	if (!allowed) {
		return next(new Error("Too many socket connection attempts"));
	}

	return next();
};

export const isSocketEventAllowed = (
	socket: AppSocket,
	eventName: string,
	maxCount: number = 60,
	windowMs: number = 60_000
): boolean => {
	const userId = socket.data.user?.id ?? socket.id;
	const key = `${eventName}:${userId}`;
	return isAllowed(eventBuckets, key, maxCount, windowMs);
};
