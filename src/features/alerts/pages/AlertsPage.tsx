import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clientsApi } from '@/features/clients/api/clients-api'
import type { Client, ClientDelivery } from '@/features/clients/types/client'
import { SemaphoreRail } from '@/features/alerts/components/SemaphoreRail'
import { mapApiError } from '@/shared/lib/api-error'
import { Label } from '@/shared/ui/label'
import { ErrorState, PageHeader } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const clientFromUrl = searchParams.get('cliente')

  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(clientFromUrl ?? '')
  const [delivery, setDelivery] = useState<ClientDelivery | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDelivery, setLoadingDelivery] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingList(true)
    void clientsApi
      .list({ status: 'ACTIVE' })
      .then((rows) => {
        if (cancelled) return
        setClients(rows)
        const initial =
          (clientFromUrl && rows.some((c) => c.id === clientFromUrl)
            ? clientFromUrl
            : rows[0]?.id) ?? ''
        setClientId(initial)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(mapApiError(err, 'No se pudieron cargar los clientes.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientFromUrl])

  useEffect(() => {
    if (!clientId) {
      setDelivery(null)
      return
    }
    let cancelled = false
    setLoadingDelivery(true)
    setError(null)
    void clientsApi
      .getDelivery(clientId)
      .then((data) => {
        if (!cancelled) setDelivery(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setDelivery(null)
          setError(mapApiError(err, 'No se pudo cargar el semáforo.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDelivery(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId])

  function onClientChange(id: string) {
    setClientId(id)
    setSearchParams(id ? { cliente: id } : {}, { replace: true })
  }

  const selected = clients.find((c) => c.id === clientId)
  const showPicker = clients.length > 1

  return (
    <div>
      <PageHeader
        eyebrow="Alertas"
        title="Semáforo"
        description="Acción sugerida por nivel de impacto, tal como está guardada para el cliente. Sin edición en este sprint."
      />

      {loadingList ? (
        <Skeleton className="h-48 w-full" />
      ) : error && !delivery ? (
        <ErrorState message={error} />
      ) : clients.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-norma-border bg-norma-raised px-5 py-10 text-sm text-norma-muted">
          No hay clientes activos para mostrar un semáforo.
        </p>
      ) : (
        <div className="space-y-5">
          {showPicker ? (
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor="alert-client">Cliente</Label>
              <Select
                id="alert-client"
                value={clientId}
                onValueChange={onClientChange}
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          ) : selected ? (
            <p className="text-sm text-norma-muted">{selected.name}</p>
          ) : null}

          {loadingDelivery ? (
            <Skeleton className="h-52 w-full" />
          ) : delivery ? (
            <SemaphoreRail actions={delivery.impactActions} />
          ) : error ? (
            <ErrorState message={error} />
          ) : null}
        </div>
      )}
    </div>
  )
}
