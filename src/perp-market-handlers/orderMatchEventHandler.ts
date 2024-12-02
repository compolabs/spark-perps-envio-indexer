import { nanoid } from "nanoid";
import { decodeI64, getISOTime } from "../utils";
import {
	Order,
	ActiveBuyOrder,
	ActiveSellOrder,
	handlerContext,
	MatchEvent,
	OrderEvent,
	FulfillEvent,
} from "generated";

export const OrderMatchEventHandler = async (
	event: any,
	context: handlerContext,
	loaderReturn: { order: Order | undefined; activeOrder: ActiveBuyOrder | ActiveSellOrder | undefined },
	orderEvent: OrderEvent
) => {

	if (event.params.identifier.case === "OrderMatchEvent") {
		const event: MatchEvent = {
			...orderEvent,
			id: `match-${nanoid()}`,
		};
		context.MatchEvent.set(event);
	} else if (event.params.identifier.case === "OrderFulfillEvent") {
		const event: FulfillEvent = {
			...orderEvent,
			id: `fullfill-${nanoid()}`,
		};
		context.FulfillEvent.set(event);
	}

	const order = loaderReturn.order;
	const activeOrder = loaderReturn.activeOrder;

	if (order) {
		const baseSizeI64 = event.params.order.payload.base_size.underlying;
		const baseSize = decodeI64(baseSizeI64);

		const updatedOrder: Order = {
			...order,
			baseSizeI64: baseSizeI64,
			baseSize: baseSize,
			status: baseSize === 0n ? "Closed" : order.status,
			timestamp: getISOTime(event.block.time),
		};

		context.Order.set(updatedOrder);

		if (activeOrder) {
			if (baseSize === 0n) {
				if (order.orderType === "Buy") {
					context.ActiveBuyOrder.deleteUnsafe(event.params.order_id);
				} else if (order.orderType === "Sell") {
					context.ActiveSellOrder.deleteUnsafe(event.params.order_id);
				}
			} else {
				if (order.orderType === "Buy") {
					const updatedActiveBuyOrder: ActiveBuyOrder = {
						...activeOrder,
						baseSizeI64: baseSizeI64,
						baseSize: baseSize,
					};
					context.ActiveBuyOrder.set(updatedActiveBuyOrder);
				} else if (order.orderType === "Sell") {
					const updatedActiveSellOrder: ActiveSellOrder = {
						...activeOrder,
						baseSizeI64: baseSizeI64,
						baseSize: baseSize,
					};
					context.ActiveSellOrder.set(updatedActiveSellOrder);
				}
			}
		}
	} else {
		context.log.warn(`Order ${event.params.order_id} not found for OrderMatchEvent.`);
	}
};
