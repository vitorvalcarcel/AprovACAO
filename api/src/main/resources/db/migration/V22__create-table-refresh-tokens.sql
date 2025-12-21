create table refresh_tokens (
    id bigserial not null,
    token varchar(255) not null unique,
    data_expiracao timestamp(6) not null,
    revoked boolean not null default false,
    usuario_id bigint,
    primary key (id),
    constraint fk_refresh_tokens_usuario foreign key (usuario_id) references usuarios(id)
);
