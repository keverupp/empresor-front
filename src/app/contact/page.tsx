import Header2 from "@/components/mvpblocks/header-2"
import Footer4Col from "@/components/mvpblocks/footer-4col"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header2 />
      <main className="flex flex-1 items-center justify-center p-6">
        <form className="w-full max-w-md space-y-4">
          <Input placeholder="Nome" required />
          <Input type="email" placeholder="E-mail" required />
          <Textarea placeholder="Mensagem" required />
          <Button type="submit" className="w-full">
            Enviar
          </Button>
        </form>
      </main>
      <Footer4Col />
    </div>
  )
}
