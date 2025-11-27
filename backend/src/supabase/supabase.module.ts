import { Module, Global } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE',
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('SUPABASE_URL');
        const key = config.get<string>('SUPABASE_KEY');

        if (!url || !key) {
          throw new Error(
            'Environment variables SUPABASE_URL and SUPABASE_KEY must be set',
          );
        }

        return createClient(url, key);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE'],
})
export class SupabaseModule {}
