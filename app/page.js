import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h2>Hello World!</h2>
      <Button>Click Me</Button>
      <UserButton/>
    </div>
  );
}
