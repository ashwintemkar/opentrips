import { TripPlannerForm } from "@/components/forms/TripPlannerForm";

const HERO = "https://upload.wikimedia.org/wikipedia/commons/9/99/Tea_plantations_in_Munnar.jpg";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative min-h-[42vh] overflow-hidden sm:min-h-[52vh]">
        <img
          src={HERO}
          alt="Tea hills and mountains in morning mist"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#f6f3ee]" />
      </section>

      <section className="relative z-10 mx-auto -mt-24 w-full max-w-3xl px-4 pb-16 sm:-mt-32 sm:px-6">
        <div className="rounded-[28px] bg-[#f7f4ef] px-5 py-8 shadow-[0_24px_80px_-32px_rgba(20,40,20,0.45)] sm:px-10 sm:py-10 [&_input]:!border-black/10 [&_input]:!bg-white [&_input]:!text-[#163226] [&_textarea]:!border-black/10 [&_textarea]:!bg-white [&_textarea]:!text-[#163226] [&_button]:!bg-[#1d4a32] [&_button]:!text-white">
          <p className="text-sm font-medium tracking-wide text-[#1d4a32] uppercase">Touch grass</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#163226] sm:text-5xl">
            Should I go out this weekend?
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-600">
            Get a short answer and a plan. Then close this and go outside.
          </p>
          <div className="mt-8">
            <TripPlannerForm />
          </div>
        </div>
      </section>
    </main>
  );
}
