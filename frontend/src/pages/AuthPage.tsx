import { Accordion, AccordionItem, Button, Input } from "@nextui-org/react";
import { useState } from "react";

import LogoGradient from "../icons/birdhouse-gradient.svg";
import { EyeFilledIcon } from "../icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../icons/EyeSlashFilledIcon";

import * as api from "../api";

export function AuthPage() {
  const [arePwdsVisible, setPwdsVisible] = useState(false);

  const [loginHandle, setLoginHandle] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regHandle, setRegHandle] = useState("");
  const [regPass, setRegPass] = useState("");

  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [regErr, setRegErr] = useState<string | null>(null);

  const canRegister = regHandle.length >= 2 && regPass.length >= 6;
  const canLogin = loginHandle.length != 0 && loginPass.length != 0;

  async function login() {
    if (!canLogin)
      return;

    const resp = await api.auth.login(loginHandle, loginPass);
    if (resp.status !== "ok") {
      setLoginErr(resp.error);
      return;
    }

    localStorage.setItem("token", resp.token);
    location.pathname = "/";
  }

  async function register() {
    if (!canRegister)
      return;

    const resp = await api.auth.register(regHandle, regPass);
    if (resp.status !== "ok") {
      setRegErr(resp.error);
      return;
    }

    localStorage.setItem("token", resp.token);
    location.pathname = "/";
  }

  function getPwdEyeButton() {
    return <button type="button"
      className="focus:outline-none"
      onClick={() => setPwdsVisible(!arePwdsVisible)}
      aria-label="toggle password visibility"
    >
      {arePwdsVisible ? (
        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
      ) : (
        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
      )}
    </button>;
  }

  return <main className="h-full flex">
    <div className="flex p-16 flex-col gap-4 bg-cover bg-[url('/src/static/bg1.jpg')] justify-center w-5/12">

      <img className="w-20 mb-4" src={LogoGradient} />

      <h1 className="text-4xl pb-1 font-bold w-1/2 bg-gradient-to-r from-teal-400 to-indigo-400 inline-block text-transparent bg-clip-text">
        Log in or register.
      </h1>

      <p>
        You aren't currently logged in to Birdhouse. Please
        log in if you have an account, or create a brand new
        one and join the fun!
      </p>
    </div>

    <div className="p-16 w-7/12 overflow-y-hidden">
      <Accordion defaultExpandedKeys={["1"]}>
        <AccordionItem
          key="1"
          title="Login"
          subtitle="Log in to an existing Birdhouse account."
        >
          <section className="flex flex-col gap-2">
            <Input
              isRequired
              label="Handle"
              className="max-w-xs"
              variant="bordered"
              value={loginHandle} onChange={ev => setLoginHandle(ev.target.value)}
            />

            <Input
              isRequired
              label="Password"
              variant="bordered"
              endContent={getPwdEyeButton()}
              type={arePwdsVisible ? "text" : "password"}
              className="max-w-xs"
              value={loginPass} onChange={ev => setLoginPass(ev.target.value)}
            />

            <Button color="primary" className="w-80" onClick={login} isDisabled={!canLogin}>Log in</Button>

            { loginErr ? <p className="text-red-600">{loginErr}</p> : <></> }

            <br></br>
          </section>
        </AccordionItem>

        <AccordionItem
          key="2"
          title="Register"
          subtitle="Create a new Birdhouse account."
        >
          <section className="flex flex-col gap-2">
            <Input
              isRequired
              label="Handle"
              className="max-w-xs"
              variant="bordered"
              placeholder="Your desired handle (username)"
              minLength={2}
              value={regHandle} onChange={ev => setRegHandle(ev.target.value)}
            />

            <Input
              isRequired
              label="Password"
              variant="bordered"
              placeholder="At least 6 characters"
              minLength={6}
              endContent={getPwdEyeButton()}
              type={arePwdsVisible ? "text" : "password"}
              className="max-w-xs"
              value={regPass} onChange={ev => setRegPass(ev.target.value)}
            />

            <Button onClick={register} variant="shadow" className="w-80" color="secondary" isDisabled={!canRegister}>Make account</Button>
            
            { regErr ? <p className="text-red-600">{regErr}</p> : <></> }

            <br></br>
          </section>
        </AccordionItem>
      </Accordion>
    </div>
  </main>;
}