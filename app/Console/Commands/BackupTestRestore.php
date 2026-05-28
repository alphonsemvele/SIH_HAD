<?php

namespace App\Console\Commands;

use App\Services\Audit\AuditTrailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class BackupTestRestore extends Command
{
    protected $signature = 'backup:test-restore {backup-path : Path to backup file}';
    
    protected $description = 'Test backup integrity by extracting and verifying SQL dump';

    public function handle(AuditTrailService $auditService): int
    {
        $backupPath = $this->argument('backup-path');
        
        if (!file_exists($backupPath)) {
            $this->error("Backup file not found: {$backupPath}");
            return 1;
        }

        $timestamp = now()->format('Y-m-d-H-i-s');
        $extractPath = "/tmp/restore-test-{$timestamp}";
        
        $this->info("Extracting backup to: {$extractPath}");
        
        try {
            // Create extraction directory
            File::makeDirectory($extractPath, 0755, true);
            
            // Extract zip
            $zip = new ZipArchive();
            if ($zip->open($backupPath) !== TRUE) {
                throw new \Exception("Failed to open zip file");
            }
            
            $zip->extractTo($extractPath);
            $zip->close();
            
            // Find SQL dump file
            $sqlFiles = File::glob("{$extractPath}/**/*.sql");
            
            if (empty($sqlFiles)) {
                throw new \Exception("No SQL dump found in backup");
            }
            
            $sqlFile = $sqlFiles[0];
            $sqlSize = filesize($sqlFile);
            
            // Verify SQL file is not empty
            if ($sqlSize === 0) {
                throw new \Exception("SQL dump file is empty");
            }
            
            // Log success to audit trail
            $auditService->log(
                'backup_test_success',
                null,
                [
                    'backup_path' => $backupPath,
                    'extract_path' => $extractPath,
                    'sql_file' => $sqlFile,
                    'sql_size' => $sqlSize,
                ],
                'backup_test'
            );
            
            $this->info("✅ Backup test successful!");
            $this->line("📁 Extracted to: {$extractPath}");
            $this->line("🗄️ SQL file: {$sqlFile}");
            $this->line("📊 SQL size: " . number_format($sqlSize) . " bytes");
            
            // Clean up
            File::deleteDirectory($extractPath);
            $this->info("🧹 Cleaned up temporary files");
            
            return 0;
            
        } catch (\Exception $e) {
            // Log failure to audit trail
            $auditService->log(
                'backup_test_failure',
                null,
                [
                    'backup_path' => $backupPath,
                    'error' => $e->getMessage(),
                ],
                'backup_test'
            );
            
            $this->error("❌ Backup test failed: " . $e->getMessage());
            
            // Clean up on failure
            if (isset($extractPath) && File::exists($extractPath)) {
                File::deleteDirectory($extractPath);
            }
            
            return 1;
        }
    }
}
