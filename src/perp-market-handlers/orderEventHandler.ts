import { OrderEvent, PerpMarket, OpenEvent, RemoveUncollaterizedEvent, RemoveAllEvent, MatchEvent, FulfillEvent } from "generated";
import { nanoid } from "nanoid";

PerpMarket.OrderEvent.handlerWithLoader({
	loader: async ({ event, context }) => {
		return {};
	},

	handler: async ({ event, context, loaderReturn }) => {
		const orderEvent: OrderEvent = {
			id: `orderEvent-${nanoid()}`,
			market: event.srcAddress,
			sender: event.params.sender.payload.bits,
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
		};
		context.OrderEvent.set(orderEvent);

		switch (event.params.identifier.case) {
			case "OrderOpenEvent":
				const openEvent: OpenEvent = {
					...orderEvent,
					id: `openEvent-${nanoid()}`,
				};
				context.OpenEvent.set(openEvent);
				break;

			case "OrderRemoveUncollaterizedEvent":
				const removeUncollateralizedEvent: RemoveUncollaterizedEvent = {
					...orderEvent,
					id: `removeUncollateralizedEvent-${nanoid()}`,
				};
				context.RemoveUncollaterizedEvent.set(removeUncollateralizedEvent);
				break;

			case "OrderRemoveEvent":
				const removeEvent: OrderEvent = {
					...orderEvent,
					id: `removeEvent-${nanoid()}`,
				};
				context.OrderEvent.set(removeEvent);
				break;

			case "OrderRemoveAllEvent":
				const removeAllEvent: RemoveAllEvent = {
					...orderEvent,
					id: `removeAllEvent-${nanoid()}`,
				};
				context.RemoveAllEvent.set(removeAllEvent);
				break;

			case "OrderMatchEvent":
				const matchEvent: MatchEvent = {
					...orderEvent,
					id: `matchEvent-${nanoid()}`,
				};
				context.MatchEvent.set(matchEvent);
				break;

			case "OrderFulfillEvent":
				const fulfillEvent: FulfillEvent = {
					...orderEvent,
					id: `fulfillEvent-${nanoid()}`,
				};
				context.FulfillEvent.set(fulfillEvent);
				break;
		}
	},
});
