export default function FaqPage() {
  const faqs = [
    {
      question: '¿Cuáles son los métodos de pago?',
      answer: 'Aceptamos pagos a través de transferencia bancaria. Una vez que solicites la inscripción a un curso, recibirás un correo con los detalles para realizar el pago.',
    },
    {
      question: '¿Puedo cancelar mi inscripción?',
      answer: 'Sí, puedes cancelar tu inscripción hasta 24 horas antes del inicio del curso para obtener un reembolso completo.',
    },
    {
      question: '¿Ofrecen certificados?',
      answer: 'Sí, al completar un curso, recibirás un certificado de finalización que podrás descargar desde tu panel de alumno.',
    },
    {
      question: '¿Cómo accedo a los cursos grabados?',
      answer: 'Una vez que te inscribas en un curso, tendrás acceso a todo el material grabado a través de tu panel de alumno. Podrás ver las clases a tu propio ritmo y en cualquier momento.',
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">FAQ</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Preguntas Frecuentes
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-8 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <div key={faq.question} className="pt-8">
                <dt className="text-lg">
                  <button className="text-left w-full flex justify-between items-start text-gray-400">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <span className="ml-6 h-7 flex items-center">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                </dt>
                <dd className="mt-2 pr-12">
                  <p className="text-base text-gray-500">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
