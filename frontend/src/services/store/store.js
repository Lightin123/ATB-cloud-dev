import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../auth/authSlice";
import userReducer from "../slices/userSlice";
import { appApi } from "../appApi";

import {
  leasesReducer,
  paymentsReducer,
  propertiesReducer,
  tenantsReducer,
  unitsReducer,
  maintenanceReducer,
  expensesReducer
} from "../slices/objectSlice";

import { eventsReducer } from "../slices/eventSlice";
import { messagesReducer } from "../slices/messageSlice";

export const store = configureStore({
  reducer: {
    [appApi.reducerPath]: appApi.reducer,
    auth: authReducer,
    user: userReducer,
    properties: propertiesReducer,
    units: unitsReducer,
    leases: leasesReducer,
    payments: paymentsReducer,
    tenants: tenantsReducer,
    maintenance: maintenanceReducer,
    events: eventsReducer,
    messages: messagesReducer,
    expenses: expensesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware)
});
