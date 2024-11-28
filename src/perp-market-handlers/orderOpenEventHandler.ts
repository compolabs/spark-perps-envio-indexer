import { nanoid } from "nanoid";
import { getISOTime } from "../utils";
import { Order, ActiveOrder, handlerContext } from "generated";

export const OpenEventHandler = async (
	event: any,
	context: handlerContext,
	loaderReturn: { order: Order | undefined; activeOrder: ActiveOrder | undefined }
) => {
	if (event.params.order.case === 'Some') {
		const order = loaderReturn.order;

		if (order) {
			const updatedOrder: Order = {
				...order,
				baseSize: event.params.order.payload.base_size.underlying,
				price: event.params.order.payload.price,
				status: "Active",
				timestamp: getISOTime(event.block.time),
			};
			context.Order.set(updatedOrder);

			const updatedActiveOrder: ActiveOrder = {
				...updatedOrder,
			};
			context.ActiveOrder.set(updatedActiveOrder);

		} else {
			const order: Order = {
				id: event.params.order_id,
				market: event.srcAddress,
				baseSize: event.params.order.payload.base_size.underlying,
				price: event.params.order.payload.price,
				trader: event.params.order.payload.trader.payload.bits,
				contractTimestamp: event.params.timestamp,
				timestamp: getISOTime(event.block.time),
				status: "Active",
			};
			context.Order.set(order);

			const activeOrder: ActiveOrder = {
				...order,
			};
			context.ActiveOrder.set(activeOrder);
		}
	} else if (event.params.order.case === 'None') {
		const order = loaderReturn.order;
		const activeOrder = loaderReturn.order;

		if (order) {
			const updatedOrder: Order = {
				...order,
				baseSize: 0n,
				status: "Closed",
				timestamp: getISOTime(event.block.time),
			};
			context.Order.set(updatedOrder);
		}

		if (activeOrder) {
			context.ActiveOrder.deleteUnsafe(event.params.order_id);
		}
	}
}