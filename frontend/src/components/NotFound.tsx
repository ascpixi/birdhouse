import { Button } from "@nextui-org/react"
import LogoGradient from "../icons/birdhouse-gradient.svg";

export function NotFound({ type }: {
    type: string
}) {
    function handleGoBack() {
        history.back();
    }

    return <main className="w-full h-full flex">
        <section className="w-1/2 h-full flex justify-center flex-col gap-4 p-12">
            <img className="w-20 mb-4" src={LogoGradient} />
            <h1 className="text-4xl pb-1 font-bold w-1/2 bg-gradient-to-r from-teal-400 to-indigo-400 inline-block text-transparent bg-clip-text">Sorry, that {type} couldn't be found.</h1>
            <p className="mb-6">The {type} might have been deleted, or you might have a typo in your URL. Either way, click the button below to go back.</p>
            <Button onClick={handleGoBack} color="primary">Go back</Button>
        </section>

        <section className="w-1/2 h-full flex justify-center flex-col gap-4 bg-cover bg-center bg-[url('/src/static/bg2.jpg')]">

        </section>

    </main>
}