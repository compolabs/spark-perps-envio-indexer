import { collateralChangeEvent } from './../../generated/src/Types.gen';
import { CollateralChangeEvent, OrderEvent, PerpMarket, Vault } from "generated";
import { nanoid } from "nanoid";
import { decodeI64, getISOTime } from '../utils';


Vault.CollateralChangeEvent.handlerWithLoader({
	loader: async ({ event, context }) => {
		// const order = await context.Order.get(event.params.order_id)
		// return {
		// 	order,
		// 	activeOrder: order ? order.orderType === "Buy"
		// 		? await context.ActiveBuyOrder.get(event.params.order_id)
		// 		: await context.ActiveSellOrder.get(event.params.order_id)
		// 		: undefined,
		// };
	},

	handler: async ({ event, context, loaderReturn }) => {
		// context.log.warn(event.params.order.case);
		const collateralChangeEvent: CollateralChangeEvent = {
			id: `collateral-${nanoid()}`,
			market: event.srcAddress,
			trader: event.params.trader.payload.bits,
			newBalance: event.params.new_balance,
			txId: event.transaction.id,
		};
		context.CollateralChangeEvent.set(collateralChangeEvent);
	},
});
