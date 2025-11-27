import { deletePayment } from "../../services/payments";

interface DeletePaymentModalProps {
  payment: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function DeletePaymentModal({
  payment,
  onClose,
  onRefresh,
}: DeletePaymentModalProps) {
  const submit = async () => {
    await deletePayment(payment.id);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-96">
        <h2 className="text-xl font-bold mb-3">Eliminar ingreso</h2>

        <p>¿Seguro que deseas eliminar este ingreso?</p>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={submit}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
