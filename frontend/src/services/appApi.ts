import { createApi } from "@reduxjs/toolkit/query/react";
import customFetchBase from "./api/customFetchBase";
import { setAccessToken, setUser } from "./auth/authSlice";
import { logoutUser } from "./auth/authActions";
import { toast } from "../components/ui/use-toast.tsx";

// ─── Temporary type aliases for missing entities ─────────────
// (Replace these with your real interfaces when available)
type Property = any;
type Unit = any;
type Tenant = any;

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: customFetchBase,
  tagTypes: [
    'Auth',
    'User',
    'Properties',
    'Units',
    'Leases',
    'Tenants',
    'Maintenance',
    'Payments',
    'Expenses',
    'Payment',
    'Messages',
    'Owners',
  ],
  endpoints: (build) => ({
    login: build.mutation<any, any>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then((data) => {
            if (data.data.accessToken) {
              dispatch(setAccessToken(data.data.accessToken));
              localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            toast({
              title: 'Success',
              description: 'Logged in successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your login',
              variant: 'error',
            });
          });
      },
    }),
    refresh: build.query<any, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken: localStorage.getItem('refreshToken') },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setAccessToken(data.accessToken));
        localStorage.setItem('refreshToken', data.refreshToken);
      },
    }),
    getUser: build.query<any, void>({
      query: () => ({
        url: '/api/user',
        method: 'GET',
      }),
      providesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));    // store fetched user in Redux
        } catch {
          // ignore errors
        }
      },
    }),
    getUnits: build.query<any, void>({
      query: () => ({
        url: '/api/units',
        method: 'GET',
      }),
      providesTags: ['Units'],
    }),
    assignTenant: build.mutation<any, any>({
      query: (data) => ({
        url: `/api/units/${data.unitId}/tenant`,
        method: 'PUT',
        body: { tenantId: data.tenantId },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Updating Unit...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Unit updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Units', 'Tenants'],
    }),
    getLeases: build.query<any, any>({
      query: (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.tenantId) queryParams.append('tenantId', filters.tenantId);
        if (filters.unitId) queryParams.append('unitId', filters.unitId);
        return { url: `/api/leases?${queryParams}`, method: 'GET' };
      },
      providesTags: (result, error, filters) => {
        if (!filters || Object.keys(filters).length === 0) {
          return ['Leases'];
        }
        return [];
      },
    }),
    createLease: build.mutation<any, any>({
      query: (body) => ({
        url: '/api/leases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leases', 'Units', 'Tenants'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Creating Lease...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Lease created successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
    }),
    getTenants: build.query<any, void>({
      query: () => ({
        url: '/api/tenants',
        method: 'GET',
      }),
      providesTags: ['Tenants'],
    }),
    getMaintenance: build.query<any, any>({
      query: (unitId) =>
        unitId != null ? `/api/maintenance?unitId=${unitId}` : '/api/maintenance',
      providesTags: (result = []) => [
        ...(result as any).map(({ id }: any) => ({ type: 'Maintenance' as const, id })),
        { type: 'Maintenance', id: 'LIST' },
      ],
    }),
    getPayments: build.query<any, void>({
      query: () => ({
        url: '/api/payments',
        method: 'GET',
      }),
      providesTags: ['Payments'],
    }),
    getExpenses: build.query<any, void>({
      query: () => ({
        url: '/api/expenses',
        method: 'GET',
      }),
      providesTags: ['Expenses'],
    }),
  getProperties: build.query<any, void>({
      query: () => ({
        url: '/api/properties',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
            ...(result as any).map(({ id }: any) => ({ type: 'Properties' as const, id })),
            { type: 'Properties', id: 'LIST' },
          ]
          : [{ type: 'Properties', id: 'LIST' }],
    }),
    getAdminProperties: build.query<any, any>({
      query: (adminId) => `/api/admin/${adminId}/properties`,
      providesTags: ['Properties'],
    }),
    // ───── singular “get by ID” endpoints ───────────────────────────────
    getProperty: build.query<Property, number>({
      query: (id) => `/api/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Properties', id }],
    }),
    getUnit: build.query<Unit, number>({
      query: (id) => `/api/units/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Units', id }],
    }),
    getTenant: build.query<Tenant, number>({
      query: (id) => `/api/tenants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tenants', id }],
    }),
    // ─── end singular “get by ID” endpoints ─────────────────────────────
    generateOverwriteCode: build.mutation<any, any>({
      query: (body) => ({
        url: '/api/admin/generate-overwrite-code',
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<any, any>({
      query: (credentials) => ({
        url: '/signup',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: build.mutation<any, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    updateLeases: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/leases`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Updating Leases...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Leases updated successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    deleteLeases: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/leases`,
        method: 'DELETE',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Deleting Leases...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Leases deleted successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    createPayments: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/payments`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Creating Payments...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Payments created successfully`,
              variant: 'success',
            });
          })
          .catch((error) => {
            console.log(error);
            toast({
              title: 'Uh oh! Something went wrong.',
              description: `${error?.error?.data?.message}`,
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Payments', 'Leases'],
    }),
    updatePayments: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/payments`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Updating Payments...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Payments updated successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Payments', 'Leases'],
    }),
    deletePayments: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/payments`,
        method: 'DELETE',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Deleting Payments...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Payment(s) deleted successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Payments', 'Leases'],
    }),
    updatePaymentSchedules: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/payment-schedules`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Updating Payment Schedules...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.data?.length} Payment Schedules updated successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    deletePaymentSchedules: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/bulk/payment-schedules`,
        method: 'DELETE',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({
          title: 'Deleting Payment Schedules...',
          variant: 'loading',
        });
        queryFulfilled
          .then((data) => {
            toast({
              title: 'Success',
              description: `${data?.data?.length} Payment Schedule(s) deleted successfully`,
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    getPayment: build.query<any, any>({
      query: (id) => ({
        url: `/api/payments/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
    createPayment: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/payments`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Creating Payment...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Payment created successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Payments', 'Leases'],
    }),
    deletePayment: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/payments/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Payment...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Payment deleted successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Payments'],
    }),
    deletePaymentSchedule: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/payment-schedules/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Planned Payment...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Planned Payment deleted successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    createExpense: build.mutation<any, any>({
      query: (body) => ({
        url: `/api/expenses`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Creating Expense...', variant: 'loading' });
        await queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Expense created successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Expenses'],
    }),
    deleteExpense: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/expenses/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Expense...', variant: 'loading' });
        await queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Expense deleted successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Expenses'],
    }),
    updateLease: build.mutation<any, any>({
      query: (data) => {
        const id = data.id;
        const body = { ...data };
        delete body.id;
        return {
          url: `/api/leases/${id}`,
          method: 'PATCH',
          body,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Updating Lease...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Lease updated successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    deleteLease: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/leases/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Lease...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Lease deleted successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Leases'],
    }),
    createMaintenanceReport: build.mutation<any, any>({
      query: (body) => ({
        url: '/api/maintenance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Maintenance'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Creating Maintenance Report...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Maintenance Report created successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
    }),
    updateMaintenanceReport: build.mutation<any, any>({
      query: ({ id, ...patch }) => ({
        url: `/api/maintenance/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Maintenance', id },
        { type: 'Maintenance', id: 'LIST' },
      ],
    }),
    deleteMaintenance: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/maintenance/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Maintenance...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Maintenance deleted successfully.',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Maintenance'],
    }),
    getMessages: build.query<any, any>({
      query: () => '/api/messages',
      providesTags: ['Messages'],
    }),
    createMessage: build.mutation<any, any>({
      query: (body) => ({
        url: '/api/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages'],
    }),
    getOwners: build.query<any, any>({
      query: () => ({
        url: '/api/owners',
        method: 'GET',
      }),
      providesTags: ['Owners'],
    }),
    updateOwners: build.mutation<any, any>({
      query: ({ ownerId, data }) => ({
        url: `/api/owners/${ownerId}`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Updating Owner...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Owner updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Owners'],
    }),
    changeUnitOwner: build.mutation<any, any>({
      query: ({ unitId, data }) => ({
        url: `/api/units/${unitId}/owner`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Updating Owner...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Owner updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Units'],
    }),
    createProperty: build.mutation<any, any>({
      query: (property) => ({
        url: '/api/properties',
        method: 'POST',
        body: {
          title: property.title,
          street: property.street,
          city: property.city,
          state: property.state,
          zip: property.zip,
          country: property.country,
          units: property.units.map((u: any) =>
            u.isNewOwner
              ? { unitNumber: u.unitNumber, owners: { create: [u.ownerFields] } }
              : { unitNumber: u.unitNumber, owners: { connect: [{ id: u.ownerId }] } }
          ),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Creating Property...', variant: 'loading' });
        queryFulfilled
          .then((data) => {
            const unitShortCodes = data.data?.data?.units?.map((unit: any) => unit.unitIdentifier);
            toast({
              title: 'Success',
              description: 'Property created successfully, your units are: ' + unitShortCodes.join(', '),
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Properties', 'Units'],
    }),
    updateProperty: build.mutation<any, any>({
      query: ({ id, updates }) => ({
        url: `/api/properties/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Updating Property...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Property updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Properties'],
    }),
    deleteProperty: build.mutation<any, any>({
      query: (id) => ({
        url: '/api/properties/' + id,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Property...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Property deleted successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Units'],
    }),
    createTenant: build.mutation<any, any>({
      query: ({ bodyData, leaseId }) => {
        const queryParams = leaseId ? '?leaseId=' + leaseId : '';
        return {
          url: `/api/tenants${queryParams}`,
          method: 'POST',
          body: bodyData,
        };
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Creating Tenant...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Tenant created successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request, please try again.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Tenants', 'Units', 'Leases'],
    }),
    updateTenant: build.mutation<any, any>({
      query: ({ id, bodyData }) => ({
        url: `/api/tenants/${id}`,
        method: 'PUT',
        body: bodyData,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Updating Tenant...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Tenant updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request, please try again.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Tenants'],
    }),
    deleteTenant: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/tenants/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Tenant...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Tenant deleted successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request, please try again.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Tenants'],
    }),
    createUnit: build.mutation<any, any>({
      query: (unit) => ({
        url: '/api/units',
        method: 'POST',
        body: unit,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Creating Unit...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Unit created successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Units'],
    }),
    updateUnit: build.mutation<any, any>({
      query: (data) => {
        const id = data.id;
        const body = { ...data };
        delete body.id;
        return {
          url: `/api/units/${id}`,
          method: 'PATCH',
          body,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Updating Unit...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Unit updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Units'],
    }),
    deleteUnit: build.mutation<any, any>({
      query: (id) => ({
        url: `/api/units/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        toast({ title: 'Deleting Unit...', variant: 'loading' });
        queryFulfilled
          .then(() => {
            toast({
              title: 'Success',
              description: 'Unit deleted successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['Units'],
    }),
    updateUser: build.mutation<any, any>({
      query: (body) => ({
        url: '/api/user',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        toast({ title: 'Updating Profile...', variant: 'loading' });
        queryFulfilled
          .then((data) => {
            dispatch(setUser(data?.data?.data));
            toast({
              title: 'Success',
              description: 'Profile updated successfully',
              variant: 'success',
            });
          })
          .catch(() => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'error',
            });
          });
      },
      invalidatesTags: ['User'],
    }),
    updateExpense: build.mutation({
  query: ({ id, ...rest }) => ({
    url: `/expenses/${id}`,
    method: 'PUT', // or PATCH depending on your backend
    body: rest,
  }),
  invalidatesTags: ['Expenses'],
}),

    deleteUser: build.mutation<any, any>({
      query: () => ({
        url: '/api/user',
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        await queryFulfilled;
        logoutUser();
      },
    }),
  deleteUserById: build.mutation<void, number>({
  query: (id) => ({
    url: `/users/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: ["User"],
}),

  }),
});

export const {
  useLoginMutation,
  useRefreshQuery,
  useGetUserQuery,
  useGetUnitsQuery,
  useAssignTenantMutation,
  useGetLeasesQuery,
  useCreateLeaseMutation,
  useGetTenantsQuery,
  useGetMaintenanceQuery,
  useGetPaymentsQuery,
  useGetExpensesQuery,
  useGetPropertiesQuery,
  useGetAdminPropertiesQuery,
  useGetPropertyQuery,
  useGetUnitQuery,
  useGetTenantQuery,
  useGenerateOverwriteCodeMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateLeasesMutation,
  useDeleteLeasesMutation,
  useCreatePaymentsMutation,
  useUpdatePaymentsMutation,
  useDeletePaymentsMutation,
  useUpdatePaymentSchedulesMutation,
  useDeletePaymentSchedulesMutation,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  useDeletePaymentScheduleMutation,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
  useCreateMaintenanceReportMutation,
  useUpdateMaintenanceReportMutation,
  useDeleteMaintenanceMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useGetOwnersQuery,
  useUpdateOwnersMutation,
  useChangeUnitOwnerMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  usePrefetch,
  useUpdateUserMutation,
  useDeleteUserByIdMutation, 
} = appApi;

export default appApi;
