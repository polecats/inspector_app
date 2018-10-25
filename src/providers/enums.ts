
export enum LookupTypes {
    Observation_General = 600,
    Observation_Connections = 700,
    Observation_Insulation = 800,
    Observation_Support = 900,
    Criticality = 100,
    Insulated = 200,
    DFT = 300,
    Findings = 400,
    Recommendation = 500,
    Position = 2000,
    Company = 3000,
    Status = 1000
}

export enum SystemEvents {
    SIGNUP = "user:signup",
    LOGIN = "user:login",
    LOGOUT = "user:logout",
    ERROR = "msg:error",
    SUCCESS = "msg:success",
    LOADER_SHOW = 'loader:show',
    LOADER_CLOSE = 'loader:close'    
}