# This script will help connect to your Supabase database using the connection string

# Connection parameters
$host = "db.kogxvvtfdgugwroszkfo.supabase.co"
$port = "5432"
$database = "postgres"
$username = "postgres"
$password = "Blue.09"

# Construct the connection string
$connectionString = "postgresql://$username:$password@$host:$port/$database"

Write-Host "Connection string: $connectionString"
Write-Host ""
Write-Host "Instructions for executing your schema:"
Write-Host "1. Make sure you have psql installed, or use the Supabase dashboard SQL Editor"
Write-Host "2. If using psql, run: psql `"$connectionString`" -f supabase_schema.sql"
Write-Host "3. If using Supabase dashboard:"
Write-Host "   a. Log in to your Supabase project"
Write-Host "   b. Go to SQL Editor"
Write-Host "   c. Create a new query"
Write-Host "   d. Paste the contents of supabase_schema.sql"
Write-Host "   e. Run the query"
Write-Host ""
Write-Host "Note: The schema contains RLS policies which will only work if your Supabase setup supports them." 