import { Collateral, collateralChangeEvent } from './../../generated/src/Types.gen';
import { CollateralChangeEvent, OrderEvent, PerpMarket, Vault } from "generated";
import { nanoid } from "nanoid";
import { decodeI64, getHash, getISOTime } from '../utils';


Vault.CollateralChangeEvent.handlerWithLoader({
	loader: async ({ event, context }) => {

	},

	handler: async ({ event, context, loaderReturn }) => {
		// context.log.warn(event.params.order.case);
		const collateralChangeEvent: CollateralChangeEvent = {
			id: `collateral-${nanoid()}`,
			market: event.srcAddress,
			trader: event.params.trader.payload.bits,
			newBalance: event.params.new_balance,
			txId: event.transaction.id,
			timestamp: getISOTime(event.block.time),
		};
		context.CollateralChangeEvent.set(collateralChangeEvent);

		const userCollateral: Collateral = {
			...collateralChangeEvent,
			id: getHash(`${event.params.trader.payload.bits}-${event.srcAddress}`),
			timestamp: getISOTime(event.block.time)
		};
		context.Collateral.set(userCollateral);
	},
});
