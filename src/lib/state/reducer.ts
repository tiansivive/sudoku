
export type ActionsTemplate = {
    [k: string]: unknown;
}
export type UnionOf<Actions extends ActionsTemplate> = Actions[keyof Actions]

export type ToStandardReducerAction<Actions extends ActionsTemplate> = {
    [K in keyof Actions]: { type: K, payload: Actions[K] }
}

export type GetAction<Actions extends ActionsTemplate, K extends keyof Actions> = ToStandardReducerAction<Actions>[K]
export type StateUpdater<S, A extends ActionsTemplate, K extends keyof ToStandardReducerAction<A>> = (state: S) => (action: GetAction<A, K>) => S



