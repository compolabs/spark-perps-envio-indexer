import { ActiveBuyOrder, ActiveSellOrder } from './../../generated/src/Types.gen';
import { nanoid } from "nanoid";
import { decodeI64, getISOTime } from "../utils";
import { Order, handlerContext, OrderEvent, OpenOrderEvent } from "generated";

export const OpenEventHandler = async (
	event: any,
	context: handlerContext,
	loaderReturn: { order: Order | undefined; activeOrder: ActiveBuyOrder | ActiveSellOrder | undefined },
	orderEvent: OrderEvent
) => {

	const openOrderEvent: OpenOrderEvent = {
		...orderEvent,
		id: `openEvent-${nanoid()}`,
	};
	context.OpenOrderEvent.set(openOrderEvent);

	const order = loaderReturn.order;
	const activeOrder = loaderReturn.activeOrder;

	if (event.params.order.case === 'Some') {

		if (order) {
			const baseSize = decodeI64(event.params.order.payload.base_size.underlying);

			const updatedOrder: Order = {
				...order,
				baseSize: decodeI64(event.params.order.payload.base_size.underlying),
				orderType: baseSize > 0 ? "Buy" : "Sell",
				timestamp: getISOTime(event.block.time),
			};
			context.Order.set(updatedOrder);

			if (activeOrder) {
				if (baseSize > 0) {
					const updatedActiveBuyOrder: ActiveBuyOrder = {
						...updatedOrder,
					};
					context.ActiveBuyOrder.set(updatedActiveBuyOrder);
				} else if (baseSize < 0) {
					const updatedActiveSellOrder: ActiveSellOrder = {
						...updatedOrder,
					};
					context.ActiveSellOrder.set(updatedActiveSellOrder);
				}
			}

		} else {
			const baseSize = decodeI64(event.params.order.payload.base_size.underlying);

			const order: Order = {
				id: event.params.order_id,
				market: event.srcAddress,
				baseSize: event.params.order.payload.base_size.underlying,
				price: event.params.order.payload.price,
				trader: event.params.order.payload.trader.payload.bits,
				orderType: baseSize > 0 ? "Buy" : "Sell",
				contractTimestamp: event.params.timestamp,
				timestamp: getISOTime(event.block.time),
				status: "Active",
			};
			context.Order.set(order);

			if (baseSize > 0) {
				const activeBuyOrder: ActiveBuyOrder = {
					...order,
				};
				context.ActiveBuyOrder.set(activeBuyOrder);
			} else if (baseSize < 0) {
				const activeSellOrder: ActiveSellOrder = {
					...order,
				};
				context.ActiveSellOrder.set(activeSellOrder);
			}
		}
	} else if (event.params.order.case === 'None') {

		if (order) {
			const updatedOrder: Order = {
				...order,
				baseSize: 0n,
				status: "Closed",
				timestamp: getISOTime(event.block.time),
			};
			context.Order.set(updatedOrder);
		}

		if (activeOrder && activeOrder.baseSize > 0) {
			context.ActiveBuyOrder.deleteUnsafe(event.params.order_id);
		} else if (activeOrder) {
			context.ActiveSellOrder.deleteUnsafe(event.params.order_id);
		}

	}
}