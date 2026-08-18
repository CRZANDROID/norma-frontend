import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { clientsApi } from '@/features/clients/api/clients-api'
import { DeliveryForm } from '@/features/clients/components/DeliveryForm'
import { StatusBadge } from '@/features/clients/components/chips'
import {
  cloneDeliveryConfig,
  defaultDeliveryConfig,
  deliveryConfigsEqual,
} from '@/features/clients/lib/delivery'
import type { ClientDetail, DeliveryConfig } from '@/features/clients/types/client'
import { UnsavedChangesGuard } from '@/shared/hooks/unsaved-changes-guard'
import { mapApiError } from '@/shared/lib/api-error'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/shared/ui/button'
import { ErrorState, PageHeader } from '@/shared/ui/page'
import { Skeleton } from '@/shared/ui/skeleton'

export function ClientAlertPolicyPage() {
  const { clientId } = useParams()
  const profile = useAuthStore((s) => s.profile)
  const canEdit = profile?.role === 'ADMIN'

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<DeliveryConfig>(defaultDeliveryConfig)
  const [baseline, setBaseline] = useState<DeliveryConfig>(defaultDeliveryConfig)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void Promise.all([
      clientsApi.get(clientId),
      clientsApi.getDelivery(clientId).catch(() => null),
    ])
      .then(([data, delivery]) => {
        if (cancelled) return
        const next = cloneDeliveryConfig(
          delivery ?? data.deliveryConfig ?? defaultDeliveryConfig(),
        )
        setClient(data)
        setConfig(next)
        setBaseline(cloneDeliveryConfig(next))
      })
      .catch((err) => {
        if (!cancelled) {
          setClient(null)
          setError(mapApiError(err, 'No se pudo cargar el cliente.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId])

  const dirty = !deliveryConfigsEqual(config, baseline)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!clientId || !canEdit || !dirty) return
    setSaving(true)
    try {
      const saved = await clientsApi.updateDelivery(clientId, config)
      setConfig(cloneDeliveryConfig(saved))
      setBaseline(cloneDeliveryConfig(saved))
      toast.success('Reglas de entrega guardadas.')
    } catch (err) {
      toast.error(mapApiError(err, 'No se pudo guardar.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Clientes"
        title="Reglas de entrega"
        description="Cómo avisar cuando un hallazgo caiga en cada color. El tablero del semáforo vive en Alertas; aquí solo se configura el aviso."
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : client ? (
        <form
          className="mx-auto max-w-3xl space-y-6 rounded-3xl border-2 border-norma-border bg-norma-surface p-5 shadow-[0_12px_32px_-18px_rgba(13,27,42,0.35)] md:p-6"
          onSubmit={onSubmit}
        >
          <UnsavedChangesGuard when={canEdit && dirty} />
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-norma-border pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {client.name}
                </h2>
                <StatusBadge status={client.status} />
              </div>
              <Link
                to={`/clientes/${client.id}?tab=datos`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-norma-signal hover:underline"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Volver a la ficha
              </Link>
            </div>
          </div>

          <DeliveryForm
            value={config}
            disabled={!canEdit}
            onChange={setConfig}
          />

          {canEdit ? (
            <div className="flex justify-end border-t-2 border-norma-border pt-4">
              <Button type="submit" disabled={!dirty || saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-norma-subtle">
              Solo un administrador puede editar esta configuración.
            </p>
          )}
        </form>
      ) : null}
    </div>
  )
}
