import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="bg-[#3B82F6] text-white">
            <div className="container mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src="/barkatullah.png"
                                alt="Barkatullah University"
                                className="w-12 h-12 rounded-lg bg-white p-1"
                            />
                            <div>
                                <h3 className="font-bold text-lg">Barkatullah University</h3>
                                <p className="text-xs text-blue-50">Bhopal, Madhya Pradesh</p>
                            </div>
                        </div>
                        <p className="text-sm text-blue-50 leading-relaxed opacity-90">
                            Secure credential verification powered by blockchain technology for transparent and tamper-proof academic records.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-blue-50">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-blue-50">
                            <li><Link to="/registry" className="hover:text-white hover:underline transition-all">Student Registry</Link></li>
                            <li><Link to="/student/grants" className="hover:text-white hover:underline transition-all">Manage Grants</Link></li>
                            <li><Link to="/employer/requests" className="hover:text-white hover:underline transition-all">Verification Requests</Link></li>
                            <li><Link to="/university/logs" className="hover:text-white hover:underline transition-all">Access Logs</Link></li>
                        </ul>
                    </div>

                    {/* For Users */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-blue-50">For Users</h4>
                        <ul className="space-y-3 text-sm text-blue-50">
                            <li><Link to="/employer/onboarding" className="hover:text-white hover:underline transition-all">Employer Registration</Link></li>
                            <li><Link to="/api-billing" className="hover:text-white hover:underline transition-all">API & Billing</Link></li>
                            <li><span className="cursor-default opacity-80">Documentation</span></li>
                            <li><span className="cursor-default opacity-80">Help Center</span></li>
                        </ul>
                    </div>

                    {/* Partners */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-blue-50">Our Partners</h4>
                        <div className="flex flex-wrap gap-4">
                            {/* <div className="bg-white p-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                                <img src="/EDUChain_dark.png" alt="EduChain" className="h-8 w-auto object-contain" />
                            </div> */}
                            <div className="bg-white p-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                                <img src="/GoG.png" alt="Geeks of Gurukul" className="h-8 w-auto object-contain" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-100 mt-4 font-medium uppercase tracking-wide">
                            Blockchain & Knowledge Partners
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-blue-400/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-blue-50">
                        © {new Date().getFullYear()} Barkatullah University. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-xs text-blue-50 font-medium">
                        <span className="flex items-center gap-2 text-green-300">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            System Operational
                        </span>
                        <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
