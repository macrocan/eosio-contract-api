export type BalancesTableRow = {
    balance: string
};

export type LogTransferActionData = {
    'from': string,
    to: string,
    quantity: string,
    memo: string
};