import { ActiveOrder, activeOrder } from './../../generated/src/Types.gen';
import { OrderEvent, PerpMarket, OpenEvent, RemoveUncollaterizedEvent, RemoveAllEvent, MatchEvent, FulfillEvent, Order } from "generated";
import { nanoid } from "nanoid";
import { getISOTime } from '../utils';

PerpMarket.OrderEvent.handlerWithLoader({
	loader: async ({ event, context }) => {
		const order = await context.Order.get(event.params.order_id)
		const activeOrder = await context.ActiveOrder.get(event.params.order_id)
		return { order, activeOrder };
	},

	handler: async ({ event, context, loaderReturn }) => {
		// context.log.warn(event.params.order.case);

		const orderEvent: OrderEvent = {
			id: `orderEvent-${nanoid()}`,
			market: event.srcAddress,
			orderId: event.params.order_id,
			identifier: event.params.identifier.case,
			trader: event.params.order.case === 'Some'
				? event.params.order.payload.trader.payload.bits
				: undefined,

			baseSize: event.params.order.case === "Some"
				? event.params.order.payload.base_size.underlying
				: undefined,

			price: event.params.order.case === "Some"
				? event.params.order.payload.price
				: undefined,

			txId: event.transaction.id,
			contractTimestamp: event.params.timestamp,
			timestamp: getISOTime(event.block.time),
		};
		context.OrderEvent.set(orderEvent);

		if (event.params.identifier.case === "OrderOpenEvent" && event.params.order.case === 'Some') {
			const order = loaderReturn.order;
			// const activeOrder = loaderReturn.activeOrder;

			if (order) {

				const updatedOrder: Order = {
					...order,
					baseSize: event.params.order.payload.base_size.underlying,
					price: event.params.order.payload.price,
					status: "Active",
					timestamp: getISOTime(event.block.time)
				};
				context.Order.set(updatedOrder);

				const updatedActiveOrder: ActiveOrder = {
					...updatedOrder,
				};
				context.ActiveOrder.set(updatedActiveOrder);
			} else {

				const newOrder: Order = {
					id: event.params.order_id,
					market: event.srcAddress,
					baseSize: event.params.order.payload.base_size.underlying,
					price: event.params.order.payload.price,
					trader: event.params.order.payload.trader.payload.bits,
					contractTimestamp: event.params.timestamp,
					timestamp: getISOTime(event.block.time),
					status: "Active",
				};
				context.Order.set(newOrder);

				const newActiveOrder: ActiveOrder = {
					...newOrder,
				};
				context.ActiveOrder.set(newActiveOrder);
			}
		}
		else if (event.params.identifier.case === "OrderOpenEvent" && event.params.order.case === 'None') {
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

	},
});
