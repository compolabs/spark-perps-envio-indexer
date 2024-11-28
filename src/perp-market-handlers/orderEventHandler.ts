import { OrderEvent, PerpMarket } from "generated";
import { nanoid } from "nanoid";
import { getISOTime } from '../utils';
import { OpenEventHandler } from './orderOpenEventHandler';

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

		if (event.params.identifier.case === "OrderOpenEvent") {
			await OpenEventHandler(event, context, loaderReturn, orderEvent);
		}

	},
});
