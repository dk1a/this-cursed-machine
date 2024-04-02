export enum TERMINAL_TYPE {
    FULL,
    SPAWN
}

export enum DIRECTION {
    OUTGOING,
    INCOMING
}

export enum TERMINAL_OUTPUT_TYPE {
    COMMAND,
    NORMAL,
    INFO,
    ALERT,
    SUCCESS,
    ERROR
}

export enum COMMAND {
    BLINK,
    HELP,
    BUILD,
    DESTROY,
    CONNECT,
    DISCONNECT,
    RESOLVE,
    RESET,
    TRANSFER,
    ORDER,
    SKIP,
    START,
    FAIL,
    ATTACH_DEPOT,
    DETACH_DEPOT,
    EMPTY_DEPOT,
    SHIP,
    BUY,
    GRADUATE
}