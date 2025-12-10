using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Channels;
using System.Threading.Tasks;
using System.Threading;

namespace ShopVision50.API.LlamaAiService
{
    public class LlamaAiService
    {
        private readonly string _llamaCliPath;
        private readonly string _modelPath;
        private readonly Channel<(string Prompt, TaskCompletionSource<string> Tcs)> _queue;

        public LlamaAiService(string llamaCliPath, string modelPath)
        {
            _llamaCliPath = llamaCliPath;
            _modelPath = modelPath;
            _queue = Channel.CreateUnbounded<(string, TaskCompletionSource<string>)>();
            Task.Run(ProcessQueueAsync);
        }

        public Task<string> QueryAsync(string prompt)
        {
            var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
            _queue.Writer.TryWrite((prompt, tcs));
            return tcs.Task;
        }

        private async Task ProcessQueueAsync()
        {
            await foreach (var (prompt, tcs) in _queue.Reader.ReadAllAsync())
            {
                try
                {
                    var result = await RunLlamaCliAsync(prompt);
                    tcs.SetResult(result);
                }
                catch (Exception ex)
                {
                    tcs.SetException(ex);
                }
            }
        }

private async Task<string> RunLlamaCliAsync(string prompt)
{   
    var psi = new ProcessStartInfo
    {
        FileName = _llamaCliPath,
        Arguments = $"-m \"{_modelPath}\" -p \"{prompt}\" -n 128 --temp 0.7 --repeat-last-n 64 --repeat-penalty 1.1 --ignore-eos -no-cnv --simple-io",
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true,
    };

    using var process = new Process { StartInfo = psi };

    var outputBuilder = new StringBuilder();
    var errorBuilder = new StringBuilder();

    var outputTcs = new TaskCompletionSource<bool>();
    var errorTcs = new TaskCompletionSource<bool>();

    process.OutputDataReceived += (sender, e) =>
    {
        if (e.Data == null)
            outputTcs.TrySetResult(true);
        else
            outputBuilder.AppendLine(e.Data);
    };

    process.ErrorDataReceived += (sender, e) =>
    {
        if (e.Data == null)
            errorTcs.TrySetResult(true);
        else
        {
            // Có thể check nếu stderr có "error" thật sự, hoặc filter, ở đây tạm bỏ qua
            // Hoặc lưu log debug để kiểm tra
            errorBuilder.AppendLine(e.Data);
        }
    };

    process.Start();

    process.BeginOutputReadLine();
    process.BeginErrorReadLine();

    await Task.WhenAll(outputTcs.Task, errorTcs.Task);
    await process.WaitForExitAsync();

    // Check exit code nếu muốn
    if (process.ExitCode != 0)
        throw new Exception($"Llama CLI exited with code {process.ExitCode}: {errorBuilder}");

    // Nếu stderr có thể bỏ qua thì thôi, không throw
    // Nếu mày muốn log thì log, không nên throw lỗi ở đây

    return outputBuilder.ToString().Trim();
}
    }
}
