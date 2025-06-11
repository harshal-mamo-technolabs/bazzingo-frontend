import { Input, Button, PasswordInput } from '../Form';

export default function LoginForm() {
    return (
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email address
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Password
              </label>
              <PasswordInput
                placeholder="Enter password"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                placeholder="Enter password"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full py-3 bg-orange-500 rounded-lg text-white font-bold tracking-wide hover:bg-orange-600 transition"
          >
            SIGNUP
          </Button>
        </form>
    )
}