import { nanoid } from "nanoid";
import { getISOTime } from "../utils";
import { Order, handlerContext, OrderEvent, RemoveUncollaterizedEvent, RemoveEvent, RemoveAllEvent, ActiveBuyOrder, ActiveSellOrder } from "generated";

export const OrderRemoveEventHandler = async (
	event: any,
	context: handlerContext,
	loaderReturn: { order: Order | undefined; activeOrder: ActiveBuyOrder | ActiveSellOrder | undefined },
	orderEvent: OrderEvent
) => {
	const order = loaderReturn.order;
	const activeOrder = loaderReturn.activeOrder;

	if (event.params.identifier.case === "OrderRemoveUncollaterizedEvent") {
		const removeUncollaterizedEvent: RemoveUncollaterizedEvent = {
			...orderEvent,
			id: `rmUncEvent-${nanoid()}`,
		};
		context.RemoveUncollaterizedEvent.set(removeUncollaterizedEvent);
	} else if (event.params.identifier.case === "OrderRemoveEvent") {
		const removeEvent: RemoveEvent = {
			...orderEvent,
			id: `rmEvent-${nanoid()}`,
		};
		context.RemoveEvent.set(removeEvent);
	} else if (event.params.identifier.case === "OrderRemoveAllEvent") {
		const removeAllEvent: RemoveAllEvent = {
			...orderEvent,
			id: `rmAllEvent-${nanoid()}`,
		};
		context.RemoveAllEvent.set(removeAllEvent);
	}


	if (order) {
		const updatedOrder: Order = {
			...order,
			baseSizeI64: 0n,
			baseSize: 0n,
			status: "Canceled",
			timestamp: getISOTime(event.block.time),
		};

		context.Order.set(updatedOrder);

		if (activeOrder) {
			if (activeOrder.orderType === "Buy") {
				context.ActiveBuyOrder.deleteUnsafe(event.params.order_id);
			} else {
				context.ActiveSellOrder.deleteUnsafe(event.params.order_id);
			}
		}
	}
}