import { useRoutes } from 'react-router-dom'
import { routes } from './router'

export default () => {
  const element = useRoutes(routes)

  return element
}
