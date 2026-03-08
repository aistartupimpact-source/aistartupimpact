export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">Contact Us</h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-2">We&apos;d love to hear from you. Reach out for partnerships, press, or feedback.</p>
      </div>
      <div className="card p-5 sm:p-8">
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 font-jakarta uppercase tracking-wider mb-1.5 block">Name</label>
              <input type="text" placeholder="Your name" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 font-jakarta uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" placeholder="your@email.com" className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 font-jakarta uppercase tracking-wider mb-1.5 block">Subject</label>
            <select className="input-field">
              <option>General Inquiry</option>
              <option>Advertising</option>
              <option>Partnership</option>
              <option>Press</option>
              <option>Bug Report</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 font-jakarta uppercase tracking-wider mb-1.5 block">Message</label>
            <textarea rows={5} placeholder="Your message..." className="input-field resize-none" />
          </div>
          <button type="submit" className="btn-brand w-full sm:w-auto">Send Message</button>
        </form>
      </div>
    </div>
  );
}
