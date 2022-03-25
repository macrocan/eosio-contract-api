-- CREATE TABLES --
CREATE TABLE standartoken_balances (
    contract character varying(12) NOT NULL,
    owner character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    amount decimal NOT NULL,
    updated_at_block bigint NOT NULL,
    updated_at_time bigint NOT NULL,
    CONSTRAINT standartoken_balances_pkey PRIMARY KEY (contract, owner, token_symbol)
);

CREATE TABLE standartoken_stats (
    contract character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    token_precision integer NOT NULL,
    supply decimal NOT NULL,
    max_supply decimal NOT NULL,
    updated_at_block bigint NOT NULL,
    updated_at_time bigint NOT NULL,
    issuer character varying(12) NOT NULL,
    CONSTRAINT standartoken_stats_pkey PRIMARY KEY (contract, token_symbol)
);

CREATE TABLE standartoken_transfers (
    transfer_id bigint NOT NULL,
    contract character varying(12) NOT NULL,
    "from" character varying(12) NOT NULL,
    "to" character varying(12) NOT NULL,
    token_symbol character varying(12) NOT NULL,
    amount decimal NOT NULL,
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
    amount decimal NOT NULL,
    memo character varying(256) NOT NULL,
    txid bytea NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,
    CONSTRAINT standartoken_retired_pkey PRIMARY KEY (contract, transfer_id)
);

-- INDEXES --
CREATE INDEX standartoken_balances_owner ON standartoken_balances USING btree (owner);

CREATE INDEX standartoken_transfers_contract_token_symbol ON standartoken_transfers USING btree (contract, token_symbol);
CREATE INDEX standartoken_transfers_from ON standartoken_transfers USING btree ("from");
CREATE INDEX standartoken_transfers_to ON standartoken_transfers USING btree ("to");
CREATE INDEX standartoken_transfers_created_at_block ON standartoken_transfers USING btree (created_at_block);
CREATE INDEX standartoken_transfers_created_at_time ON standartoken_transfers USING btree (created_at_time);

CREATE INDEX standartoken_retired_contract_token_symbol ON standartoken_retired USING btree (contract, token_symbol);
CREATE INDEX standartoken_retired_created_at_block ON standartoken_retired USING btree (created_at_block);
CREATE INDEX standartoken_retired_created_at_time ON standartoken_retired USING btree (created_at_time);