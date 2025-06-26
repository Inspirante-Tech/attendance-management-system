import LoginForm from '@/components/login-form'

interface LoginPageProps {
  params: {
    role: "student" | "teacher" | "admin" | "report_viewers"
  }
}

export default function LoginPage({ params }: LoginPageProps) {
  const { role } = params
  
  // Validate role
  const validRoles = ["student", "teacher", "admin", "report_viewers"]
  if (!validRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Role</h1>
          <p className="text-gray-600">The requested role does not exist.</p>
        </div>
      </div>
    )
  }
  
  return <LoginForm role={role} />
}
