import { OrderEvent, PerpMarket } from "generated";
import { nanoid } from "nanoid";
import { decodeI64, getISOTime } from '../utils';
import { OpenEventHandler } from './orderOpenEventHandler';
import { OrderRemoveEventHandler } from "./orderRemoveEventHandler";
import { OrderMatchEventHandler } from "./orderMatchEventHandler";

PerpMarket.OrderEvent.handlerWithLoader({
	loader: async ({ event, context }) => {
		const order = await context.Order.get(event.params.order_id)
		return {
			order,
			activeOrder: order ? order.orderType === "Buy"
				? await context.ActiveBuyOrder.get(event.params.order_id)
				: await context.ActiveSellOrder.get(event.params.order_id)
				: undefined,
		};
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

			baseSizeI64: event.params.order.case === "Some"
				? event.params.order.payload.base_size.underlying
				: undefined,

			baseSize: event.params.order.case === "Some"
				? decodeI64(event.params.order.payload.base_size.underlying)
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
		} else if (
			event.params.identifier.case === "OrderRemoveUncollaterizedEvent" ||
			event.params.identifier.case === "OrderRemoveEvent" ||
			event.params.identifier.case === "OrderRemoveAllEvent") {
			await OrderRemoveEventHandler(event, context, loaderReturn, orderEvent);
		} else if (
			event.params.identifier.case === "OrderMatchEvent" ||
			event.params.identifier.case === "OrderFulfillEvent"
		) {
			// await OrderMatchEventHandler(event, context, loaderReturn, orderEvent);
		}

	},
});
