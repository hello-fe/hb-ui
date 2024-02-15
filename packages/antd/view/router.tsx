import React from 'react'
import {
  type RouteObject,
} from 'react-router-dom'
import Layout from './Layout'
import Form from './form'
import Table  from './table'
import TableEdit  from './table-edit'
import SelectionTable  from './selectionTable'

// https://stackblitz.com/github/remix-run/react-router/tree/main/examples/route-objects?file=src%2FApp.tsx
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/form',
        element: <Form />,
      },
      {
        path: '/table',
        element: <Table />,
      },
      {
        path: '/selection-Table',
        element: <SelectionTable />,
      },
      {
        path: '/table-edit',
        element: <TableEdit />,
      },
    ],
  },
]