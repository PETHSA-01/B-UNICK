import { Navigate, useSearchParams } from 'react-router'

// El feed de maquillajes vive en el inicio (/); /maquillajes redirige
// preservando los query params (p. ej. los del botón "Utilizar" de la Wiki).
export const RedirigirMaquillajes = () => {
  const [searchParams] = useSearchParams()
  const consulta = searchParams.toString()
  return <Navigate to={consulta ? `/?${consulta}` : '/'} replace />
}