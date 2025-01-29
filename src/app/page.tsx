import { SignInButton, SignOutButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <div>

      <SignInButton />
      <br />
      <SignOutButton />
     
    </div>
  );
}
