-- CREATE TABLES --
CREATE TABLE standartoken_balances (
    contract character varying(12) NOT NULL,
    owner character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    amount bigint NOT NULL,
    updated_at_block bigint NOT NULL,
    updated_at_time bigint NOT NULL,
    CONSTRAINT standartoken_balances_pkey PRIMARY KEY (contract, owner, token_symbol)
);

CREATE TABLE standartoken_stats (
    contract character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    token_precision integer NOT NULL,
    supply bigint NOT NULL,
    max_supply bigint NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,
    issuer character varying(12) NOT NULL,
    CONSTRAINT standartoken_stats_pkey PRIMARY KEY (contract, token_symbol)
);

CREATE TABLE standartoken_transfers (
    transfer_id bigint NOT NULL,
    contract character varying(12) NOT NULL,
    "from" character varying(12) NOT NULL,
    "to" character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    amount bigint NOT NULL,
    memo character varying(256) NOT NULL,
    txid bytea NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,
    CONSTRAINT standartoken_transfers_pkey PRIMARY KEY (contract, transfer_id)
);

CREATE TABLE standartoken_retired (
    transfer_id bigint NOT NULL,
    contract character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    amount bigint NOT NULL,
    memo character varying(256) NOT NULL,
    txid bytea NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,
    CONSTRAINT standartoken_retired_pkey PRIMARY KEY (contract, transfer_id)
);