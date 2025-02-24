#include <iostream>
#include <cmath>
#include <algorithm>
#include <numeric>
#include <emscripten.h>
#include <cstring>

extern "C"
{

    // محاسبه میانگین
    EMSCRIPTEN_KEEPALIVE
    double mean(const double *data, int size)
    {
        if (size == 0)
            return NAN;
        double sum = std::accumulate(data, data + size, 0.0);
        return sum / size;
    }

    // محاسبه چارک‌ها (Q1, Q2, Q3)
    EMSCRIPTEN_KEEPALIVE
    void quartiles(double *data, int size, double *output)
    {
        if (size < 4)
        {
            output[0] = output[1] = output[2] = NAN;
            return;
        }
        std::sort(data, data + size);
        auto percentile = [&](double p)
        {
            size_t index = std::round(p * (size - 1));
            return data[index];
        };
        output[0] = percentile(0.25);
        output[1] = percentile(0.50);
        output[2] = percentile(0.75);
    }

    // محاسبه واریانس
    EMSCRIPTEN_KEEPALIVE
    double variance(const double *data, int size)
    {
        if (size < 2)
            return NAN;
        double m = mean(data, size);
        double sum = std::accumulate(data, data + size, 0.0,
                                     [&](double acc, double x)
                                     { return acc + (x - m) * (x - m); });
        return sum / (size - 1);
    }

    // محاسبه انحراف معیار
    EMSCRIPTEN_KEEPALIVE
    double standardDeviation(const double *data, int size)
    {
        return std::sqrt(variance(data, size));
    }

    // محاسبه دامنه
    EMSCRIPTEN_KEEPALIVE
    double range(const double *data, int size)
    {
        if (size == 0)
            return NAN;
        auto [min_it, max_it] = std::minmax_element(data, data + size);
        return *max_it - *min_it;
    }

    // محاسبه دامنه بین چارکی (IQR)
    EMSCRIPTEN_KEEPALIVE
    double interquartileRange(double *data, int size)
    {
        if (size < 4)
            return NAN;
        std::sort(data, data + size);
        size_t q1_idx = size / 4;
        size_t q3_idx = 3 * size / 4;
        return data[q3_idx] - data[q1_idx];
    }

    // محاسبه چولگی (Skewness)
    EMSCRIPTEN_KEEPALIVE
    double skewness(const double *data, int size)
    {
        if (size < 2)
            return NAN;
        double m = mean(data, size);
        double sd = standardDeviation(data, size);
        double sum3 = std::accumulate(data, data + size, 0.0,
                                      [&](double sum, double x)
                                      { return sum + std::pow(x - m, 3); });
        return (sum3 / size) / std::pow(sd, 3);
    }

    // محاسبه کشیدگی (Kurtosis)
    EMSCRIPTEN_KEEPALIVE
    double kurtosis(const double *data, int size)
    {
        if (size < 2)
            return NAN;
        double m = mean(data, size);
        double sd = standardDeviation(data, size);
        double sum4 = std::accumulate(data, data + size, 0.0,
                                      [&](double sum, double x)
                                      { return sum + std::pow(x - m, 4); });
        return (sum4 / size) / std::pow(sd, 4) - 3.0;
    }

    // محاسبه ضریب تغییرات (Coefficient of Variation - CV)
    EMSCRIPTEN_KEEPALIVE
    double coefficientOfVariation(const double *data, int size)
    {
        if (size < 2)
            return NAN;
        double m = mean(data, size);
        double sd = standardDeviation(data, size);
        return (sd / m) * 100;
    }

    // منحنی چگال داده ها
    EMSCRIPTEN_KEEPALIVE
    void generateNormalPDF(const double *data, double *output, int size, int numPoints = 201)
    {
        if (size == 0)
            return;

        double m = mean(data, size);
        double sd = standardDeviation(data, size);

        double lower = m - 4 * sd;
        double upper = m + 4 * sd;
        double step = (upper - lower) / (numPoints - 1);

        for (int i = 0; i < numPoints; i++)
        {
            double x = lower + i * step;
            output[i] = (1.0 / (sd * std::sqrt(2 * M_PI))) * std::exp(-std::pow(x - m, 2) / (2 * std::pow(sd, 2)));
        }
    }

    // منحنی توزیع نرمال
    EMSCRIPTEN_KEEPALIVE
    void generateNormalCurve(const double *data, double *outputX, double *outputY, int size, int numPoints = 201)
    {
        if (size < 2)
            return;

        double m = mean(data, size);
        double sd = standardDeviation(data, size);

        // محدوده ۴ انحراف معیار از میانگین
        double lower = m - 4 * sd;
        double upper = m + 4 * sd;
        double step = (upper - lower) / (numPoints - 1);

        for (int i = 0; i < numPoints; i++)
        {
            double x = lower + i * step;
            double y = (1.0 / (sd * std::sqrt(2 * M_PI))) * std::exp(-0.5 * std::pow((x - m) / sd, 2));
            outputX[i] = x;
            outputY[i] = y;
        }
    }

    // محاسبه فراوانی داده‌های گسسته
    EMSCRIPTEN_KEEPALIVE
    void discreteFrequencies(const double *data, int size, double *values, int *frequencies, int *uniqueCount)
    {
        std::unordered_map<double, int> freq;
        for (int i = 0; i < size; i++)
        {
            freq[data[i]]++;
        }
        *uniqueCount = freq.size();
        int index = 0;
        for (const auto &pair : freq)
        {
            values[index] = pair.first;
            frequencies[index] = pair.second;
            index++;
        }
    }

    // محاسبه مقادیر حداقل و حداکثر
    EMSCRIPTEN_KEEPALIVE
    void minMax(double *data, int size, double *output)
    {
        if (size == 0)
        {
            output[0] = 0;
            output[1] = 0;
            return;
        }

        auto [min_it, max_it] = std::minmax_element(data, data + size);

        output[0] = *min_it;
        output[1] = *max_it;
        return;
    }

    // محاسبه هیستوگرام برای داده‌های پیوسته
    EMSCRIPTEN_KEEPALIVE
    double *continuousHistogram(const double *data, int size, int bins)
    {
        if (size == 0 || bins <= 0)
            return nullptr;

        // پیدا کردن حداقل و حداکثر مقدار داده‌ها
        auto [min_it, max_it] = std::minmax_element(data, data + size);
        double min_val = *min_it, max_val = *max_it;

        // جلوگیری از تقسیم بر صفر
        double range = max_val - min_val;
        if (range == 0.0)
        {
            // اگر تمام داده‌ها یکسان باشند، تمام مقدارها را در یک bin قرار می‌دهیم.
            double *result = (double *)malloc(2 * bins * sizeof(double));
            memset(result, 0, 2 * bins * sizeof(double));
            result[bins - 1] = size;
            result[(2 * bins) - 1] = min_val;
            return result;
        }

        double bin_width = range / bins;

        // اختصاص حافظه برای ذخیره فرکانس‌ها و مراکز bin
        double *result = (double *)malloc(2 * bins * sizeof(double));
        double *frequencies = result;       // اولین نصف حافظه برای فرکانس‌ها
        double *binCenters = result + bins; // دومین نصف حافظه برای مراکز بازه‌ها

        std::fill(frequencies, frequencies + bins, 0);

        for (int i = 0; i < bins; i++)
        {
            binCenters[i] = min_val + (i + 0.5) * bin_width; // مرکز هر بازه
        }

        // محاسبه‌ی تعداد داده‌های داخل هر bin
        for (int i = 0; i < size; i++)
        {
            int bin_index = std::min(static_cast<int>((data[i] - min_val) / bin_width), bins - 1);
            frequencies[bin_index]++;
        }

        return result; // آدرس حافظه‌ای که شامل دو آرایه است برمی‌گردد.
    }
}
