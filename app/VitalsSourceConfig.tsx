"use client";

interface Props {
  onConnect: (socketUrl: string) => void;
}

export default function ConfigurationForm({ onConnect }: Props) {
  return (
    <form
      className="p-2 flex items-center gap-2 whitespace-nowrap"
      onSubmit={(e) => {
        e.preventDefault();
        const socketUrl = e.currentTarget.socketUrl.value;
        onConnect(socketUrl);
      }}
    >
      <label>Web Socket URL : </label>
      <input
        name="socketUrl"
        type="text"
        placeholder="wss://<middleware_hostname>/observations/<ip_address>"
        defaultValue="wss://dev_middleware.coronasafe.live/observations/192.168.1.14"
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Connect
      </button>
    </form>
  );
}
