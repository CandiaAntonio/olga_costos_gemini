import { NewGemForm } from "@/components/stones/NewGemForm";

export default function NewStonePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif text-lebedeva-black mb-2">
          Ingresar Nueva Piedra
        </h1>
        <div className="w-16 h-px bg-lebedeva-gold mx-auto opacity-50" />
      </div>
      <NewGemForm />
    </div>
  );
}
